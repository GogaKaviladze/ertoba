import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


type RawArticle = {
  headline?: string
  title?: string
  body?: string
  text?: string
  published_at?: string
  url?: string
}

type ArticleBatchItem = {
  headline: string
  url: string | null
  publishedAt: Date
  sourcePublisher: string
  dominantFraming: string
  framingScore: number
}

type PulseAggregate = {
  institutional: number
  psychological: number
  societal: number
  geopolitical: number
  count: number
}

type PulseBatchItem = {
  date: Date
  institutional: number
  psychological: number
  societal: number
  geopolitical: number
}

const THESIS_CATEGORIES = {
    "როგორ გვზღუდავენ": ["სასამართლო", "განათლება", "პოლიცია", "დაკავება", "ჯარიმა", "მოსამართლე", "უმცირესობები", "ჩარევა", "ბიუროკრატია", "არჩევნები"],
    "როგორ გვთრგუნავენ": ["შიში", "ომი", "საფრთხე", "მეორე ფრონტი", "პანიკა", "დეზინფორმაცია", "სუვერენიტეტის დაკარგვა", "განადგურება", "მსხვერპლი"],
    "როგორ გვყოფენ": ["ტრადიცია", "ლგბტ", "პოლარიზაცია", "დაპირისპირება", "ღირებულებები", "ოჯახი", "ტრადიციული", "პროპაგანდა", "დასავლეთი"],
    "გავლენები და ეკლესია": ["ეკლესია", "რუსეთი", "პატრიარქი", "მართლმადიდებლობა", "რწმენა", "ევროკავშირი", "აგენტურა", "გლობალური ომის პარტია", "ოკუპაცია", "სუვერენიტეტი"]
};

function cleanText(text: string): string {
    return text.toLowerCase().replace(/[^\w\s\u10D0-\u10FA]/g, ''); // Georgian range support
}

async function main() {
    console.log("Starting data seeding process...");
    // Only process a subset to avoid blowing up the free tier DB while still giving a massive dataset representation
    const MAX_ARTICLES = 5000; 
    let processedArticles = 0;
    let savedArticles = 0;

    const filePath = path.join(__dirname, '../../Propaganda.json');
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const articleBatch: ArticleBatchItem[] = [];
    const pulseData: Record<string, PulseAggregate> = {};

    for await (const line of rl) {
        if (!line.trim()) continue;
        processedArticles++;
        if (processedArticles > MAX_ARTICLES) break;

        try {
            const obj = JSON.parse(line) as RawArticle;
            const headline = obj.headline || obj.title || '';
            const body = obj.body || obj.text || '';
            const fullText = cleanText(`${headline} ${body}`);

            if (!fullText) continue;

            const frames: Record<string, number> = {};
            for (const [category, keywords] of Object.entries(THESIS_CATEGORIES)) {
                let count = 0;
                for (const kw of keywords) {
                    const occurrences = (fullText.match(new RegExp(kw, 'g')) || []).length;
                    count += occurrences;
                }
                if (count > 0) frames[category] = count;
            }

            if (Object.keys(frames).length === 0) continue; // Skip neutral articles for the dashboard

            // Find dominant frame
            let dominantFraming = "სხვა / ნეიტრალური";
            let maxScore = 0;
            for (const [cat, score] of Object.entries(frames)) {
                if (score > maxScore) {
                    maxScore = score;
                    dominantFraming = cat;
                }
            }

            const publishedAt = obj.published_at ? new Date(obj.published_at) : new Date();
            const dateStr = publishedAt.toISOString().split('T')[0];

            // 1. Prepare Article
            let source = "Unknown";
            if (obj.url) {
                try { source = new URL(obj.url).hostname.replace('www.', ''); } catch {}
            }

            articleBatch.push({
                headline: headline.substring(0, 250), // prevent massive strings
                url: obj.url ? obj.url.substring(0, 250) : null,
                publishedAt,
                sourcePublisher: source,
                dominantFraming,
                framingScore: maxScore
            });

            // 2. Aggregate Daily Pulse
            if (!pulseData[dateStr]) {
                pulseData[dateStr] = { institutional: 0, psychological: 0, societal: 0, geopolitical: 0, count: 0 };
            }
            if (dominantFraming === "როგორ გვზღუდავენ") pulseData[dateStr].institutional += 1;
            if (dominantFraming === "როგორ გვთრგუნავენ") pulseData[dateStr].psychological += 1;
            if (dominantFraming === "როგორ გვყოფენ") pulseData[dateStr].societal += 1;
            if (dominantFraming === "გავლენები და ეკლესია") pulseData[dateStr].geopolitical += 1;
            pulseData[dateStr].count += 1;

            if (articleBatch.length >= 1000) {
                await prisma.propagandaArticle.createMany({ data: articleBatch, skipDuplicates: true });
                savedArticles += articleBatch.length;
                console.log(`Saved ${savedArticles} articles...`);
                articleBatch.length = 0;
            }

        } catch {
            continue;
        }
    }

    if (articleBatch.length > 0) {
        await prisma.propagandaArticle.createMany({ data: articleBatch, skipDuplicates: true });
        savedArticles += articleBatch.length;
         console.log(`Saved ${savedArticles} articles...`);
    }

    console.log("Saving Daily Pulse Data...");
    const pulseBatch: PulseBatchItem[] = [];
    for (const [dateStr, counts] of Object.entries(pulseData)) {
        if (counts.count === 0) continue;
        pulseBatch.push({
            date: new Date(dateStr),
            institutional: counts.institutional,
            psychological: counts.psychological,
            societal: counts.societal,
            geopolitical: counts.geopolitical,
        });
    }

    // Insert pulses ignoring conflicts (or upsert if needed, but createMany handles skipDuplicates)
    if (pulseBatch.length > 0) {
        await prisma.dailyPulse.createMany({ data: pulseBatch, skipDuplicates: true });
        console.log(`Saved ${pulseBatch.length} daily pulse records.`);
    }

    console.log("Seeding Complete!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
