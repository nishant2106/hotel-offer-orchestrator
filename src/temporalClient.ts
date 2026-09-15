import { Connection, Client } from "@temporalio/client"
import { config } from "./config"

let clientPromise: Promise<Client> | undefined

export async function getTemporalClient(): Promise<Client> {
  clientPromise ??= Connection.connect({ address: config.temporalAddress }).then(
    (connection) =>
      new Client({
        connection,
        namespace: config.temporalNamespace,
      }),
  )

  return clientPromise
}
