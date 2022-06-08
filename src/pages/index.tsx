import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { AiOutlineCalendar } from 'react-icons/ai';
import { TbUser } from 'react-icons/tb';

import Link from 'next/link';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';
import { dateFormatted } from '../utils/formatDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function formatPosts(postsResponse): Post[] {
  return postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function morePosts(): Promise<void> {
    const resultPosts = await fetch(nextPage);
    const postsParser = await resultPosts.json();

    const newPosts = formatPosts(postsParser);

    setNextPage(postsParser.next_page);
    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <main className={commonStyles.container}>
        <div className={commonStyles.containerContent}>
          {posts.map(post => (
            <article className={styles.content} key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a href="/">
                  <h1>{post.data.title}</h1>
                  <h2>{post.data.subtitle}</h2>
                </a>
              </Link>
              <div className={commonStyles.info}>
                <div>
                  <span>
                    <AiOutlineCalendar
                      style={{ width: '20px', height: '20px' }}
                    />
                  </span>
                  <time>{dateFormatted(post.first_publication_date)}</time>
                </div>
                <div>
                  <span>
                    <TbUser
                      style={{
                        width: '20px',
                        height: '20px',
                        fontWeight: 'bold',
                      }}
                    />
                  </span>
                  <span>{post.data.author}</span>
                </div>
              </div>
            </article>
          ))}
          {nextPage && (
            <button
              type="button"
              className={styles.morePostsButton}
              onClick={morePosts}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts', {
    orderings: 'first_publication_date desc',
    pageSize: 1,
  });

  const posts: Post[] = formatPosts(postsResponse);

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
