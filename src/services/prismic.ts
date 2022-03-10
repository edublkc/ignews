import * as prismic from '@prismicio/client'
import fetch from 'node-fetch'

const accessToken = process.env.PRISMIC_ACCESS_TOKEN
const repoName = 'ignewsedublkc'
const endpoint = prismic.getEndpoint(repoName)

export const client = prismic.createClient(endpoint, { fetch,accessToken})