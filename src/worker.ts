import { NativeConnection, Worker } from "@temporalio/worker"
import * as activities from "./activities"
import { config } from "./config"
import { logger } from "./logger"

async function run(): Promise<void> {
  const connection = await NativeConnection.connect({ address: config.temporalAddress })
  const worker = await Worker.create({
    connection,
    namespace: config.temporalNamespace,
    taskQueue: config.taskQueue,
    workflowsPath: require.resolve("./workflows"),
    activities,
  })

  logger.info({ taskQueue: config.taskQueue }, "Temporal worker started")
  await worker.run()
}

run().catch((error) => {
  logger.error({ error }, "Temporal worker failed")
  process.exit(1)
})
