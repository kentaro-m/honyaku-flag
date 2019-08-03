"use strict"

import { App } from "@slack/bolt"
import Translation from "./models/translation"
require("dotenv").config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

app.event(
  "reaction_added",
  async ({ event, context }): Promise<void> => {
    try {
      const translation = new Translation(app, event, context)
      await translation.translate()
    } catch (error) {
      console.log(error)
    }
  }
)
;(async (): Promise<void> => {
  await app.start(process.env.PORT || 8080)

  console.log("⚡️ Bolt app is running!")
})()
