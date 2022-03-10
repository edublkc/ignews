import { stripe } from './../../services/strip';
import { Stripe } from 'stripe';
import { NextApiResponse } from 'next';
import { NextApiRequest } from 'next';

import { Readable } from "stream"
import { saveSubscription } from './_lib/managerSubscription';

async function buffer(readable: Readable) {
    const chunks = []

    for await (const chunk of readable) {
        chunks.push(
            typeof chunk === "string" ? Buffer.from(chunk) : chunk
        )
    }

    return Buffer.concat(chunks)
}

export const config = {
    api: {
        bodyParser: false
    }
}

const relevantEvents = new Set([
    'checkout.session.completed'
])

export default async function (req: NextApiRequest, res: NextApiResponse) {
    console.log('to sendo chamado pelo menos')
    if (req.method === 'POST') {
        const buf = await buffer(req)
        const secret = req.headers['stripe-signature']

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
        } catch (err) {
            return res.status(400).send('Webhook error:' + err.message)
        }

        const { type } = event

        if (relevantEvents.has(type)) {
            try {
                switch (type) {
                    case 'checkout.session.completed':
                        const checkouSession = event.data.object as Stripe.Checkout.Session
                        await saveSubscription(checkouSession.subscription.toString(), checkouSession.customer.toString())
                        console.log('caiu no type')
                        break
                    default:
                        console.log('caiu no default')
                        throw new Error('Unhandled event.')
                }
            } catch (err) {
                return res.json({ error: 'Webhook handler failed.' })
            }
        }


        res.status(200).json({ received: true })

    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}