import styles from "./styles.module.scss"
import Head from "next/head"
import { GetStaticPaths, GetStaticProps } from "next"
import { client } from "../../services/prismic"
import * as prismic from "@prismicio/client"
import { RichText } from "prismic-dom"
import Link from "next/link"


interface PostsProps {
    posts: Posts[]
}

type Posts = {
    slug: string,
    title: string,
    excerpt: string,
    updatedAt: string
}

export default function Posts({ posts }: PostsProps) {
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>

                    {posts.map(post => (
                        <Link key={post.slug} href={`/posts/${post.slug}`}>
                            <a>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>
                    ))}
                    
                </div>
            </main>
        </>
    )
}



export const getStaticProps: GetStaticProps = async () => {

    const response = await client.get(
        {
            predicates: [
                prismic.predicate.at('document.type', 'post')
            ]
        }
    )

    const posts = response.results.map(post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: post.data.content.find(content => content.type === "paragraph")?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }
    })

    return {
        props: {
            posts
        },
        redirect: 60 * 30 //30 minutes
    }

}