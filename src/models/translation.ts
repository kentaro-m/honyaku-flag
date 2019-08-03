import { App, ReactionAddedEvent, Context } from "@slack/bolt"
import { findLanguageCode } from "../utils/language"
import { isInvitedBot } from "../utils/bot"
import { langcodes } from "../constants/langcodes"
import { Translate } from "@google-cloud/translate"

class Translation {
  private app: App
  private event: ReactionAddedEvent
  private context: Context

  public constructor(app: App, event: ReactionAddedEvent, context: Context) {
    this.app = app
    this.event = event
    this.context = context
  }

  public async translate(): Promise<void> {
    try {
      const langcode: string = findLanguageCode(this.event.reaction, langcodes)

      if (!langcode) {
        return
      }

      const item: any = this.event.item

      const userId: string = process.env.SLACK_USER_ID || ""

      /**
       * INFO: A check for running the app only on the channel which the app was invited.
       */
      if (userId) {
        const members: any = await this.app.client.conversations.members({
          token: process.env.SLACK_OAUTH_TOKEN,
          channel: item.channel
        })

        if (!isInvitedBot(userId, members.members)) {
          return
        }
      }

      const messages: any = await this.app.client.conversations.replies({
        token: process.env.SLACK_OAUTH_TOKEN,
        channel: item.channel,
        ts: item.ts,
        limit: 1,
        inclusive: true
      })

      const translate = new Translate({
        key: process.env.TRANSLATION_API_TOKEN
      })
      const [translation] = await translate.translate(
        messages.messages[0].text,
        langcode
      )

      await this.app.client.chat.postMessage({
        token: this.context.botToken,
        channel: item.channel,
        text: "",
        attachments: [
          {
            color: "#1a73e8",
            pretext: `The message is translated in :${this.event.reaction}: (${langcode}).`,
            fields: [
              {
                title: "Translated Message",
                value: translation,
                short: false
              },
              {
                title: "Original Message",
                value: messages.messages[0].text,
                short: false
              }
            ]
          }
        ],
        // eslint-disable-next-line @typescript-eslint/camelcase
        thread_ts: item.ts
      })
    } catch (error) {
      const item: any = this.event.item

      await this.app.client.chat.postMessage({
        token: this.context.botToken,
        channel: item.channel,
        text: "Oops! Something Went Wrong :nauseated_face:\nPlease try again.",
        // eslint-disable-next-line @typescript-eslint/camelcase
        thread_ts: item.ts
      })

      throw error
    }
  }
}

export default Translation
