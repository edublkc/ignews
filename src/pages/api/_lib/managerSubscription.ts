import { fauna } from './../../../services/fauna';
import { query as q } from 'faunadb';

import { stripe } from '../../../services/strip';

export async function saveSubscription(subscriptionId: string, costumerId: string) {

    console.log(subscriptionId,costumerId)

    
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_customer_id'), costumerId
                )
            )
        )

    )

    console.log('>>>>>>>>>>>>>>>>>>>>>>>CAIU AQUI')


    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id
    }

    await fauna.query(
        q.Create(
            q.Collection('subscriptions'), { data: subscriptionData }
        )
    )

    console.log('>>>>>>>>>>>>>>>>>>>>>>>FOI ATE O FIM')
}