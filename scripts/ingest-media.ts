import 'dotenv/config'
import { runDailyMediaIngestion } from '../src/services/mediaIngestionService'

async function main() {
  console.log('🚀 Starting Automated Daily Media Ingestion...')
  const startTime = Date.now()

  try {
    const summary = await runDailyMediaIngestion()
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('✅ Ingestion Completed Successfully!')
    console.log(`⏱️ Duration: ${elapsedSeconds}s`)
    console.log(`📰 Total Fetched: ${summary.totalFetched}`)
    console.log(`💾 New Articles Saved: ${summary.newArticlesSaved}`)
    console.log(`⏭️ Duplicates Skipped: ${summary.duplicatesSkipped}`)
    console.log('📊 Framing Counts:')
    console.log(`   - Institutional (როგორ გვზღუდავენ): ${summary.classifiedFramings.institutional}`)
    console.log(`   - Psychological (როგორ გვთრგუნავენ): ${summary.classifiedFramings.psychological}`)
    console.log(`   - Societal (როგორ გვყოფენ): ${summary.classifiedFramings.societal}`)
    console.log(`   - Geopolitical (გავლენები და ეკლესია): ${summary.classifiedFramings.geopolitical}`)
  } catch (error) {
    console.error('❌ Ingestion Failed:', error)
    process.exit(1)
  }
}

main()
