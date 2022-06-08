import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai';
import { TbUser } from 'react-icons/tb';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { dateFormatted } from '../../utils/formatDate';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function formatPost(data: any): Post {
  return {
    first_publication_date: dateFormatted(data.first_publication_date),
    data: {
      title: data.data.title,
      banner: {
        url: data.data.banner.url,
      },
      author: data.data.author,
      content: data.data.content.map(c => {
        return {
          heading: c.healing ?? c.heading,
          body: RichText.asHtml(c.body),
        };
      }),
    },
  };
}

export default function Post({ post }: PostProps): JSX.Element {
  const [postData, setPostData] = useState(formatPost(post));
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }
  const postFormatted = formatPost(post);

  return (
    <>
      <Head>
        <title>Post | {postData.data.title}</title>
      </Head>
      <div className={styles.containerMain}>
        <img src={postData.data.banner.url} alt="" />
        <div className={commonStyles.container}>
          <article
            className={`${commonStyles.containerContent} ${styles.content}`}
          >
            <h1 className={styles.title}>{postData.data.title}</h1>
            <div className={commonStyles.info}>
              <div>
                <span>
                  <AiOutlineCalendar
                    style={{ width: '20px', height: '20px' }}
                  />
                </span>
                <time>{postData.first_publication_date}</time>
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
                <span>{postData.data.author}</span>
              </div>
              <div>
                <span>
                  <AiOutlineClockCircle
                    style={{ width: '20px', height: '20px' }}
                  />
                </span>
                <time>4 min</time>
              </div>
            </div>
            <span className={styles.editPostInfo}>
              * editado em 19 mar 2021, às 15:49
            </span>
            {postData.data.content.map(content => (
              <section
                key={`${Math.random()}-${content.heading}`}
                className={styles.contentHeading}
              >
                <h1>{content.heading}</h1>
                <div dangerouslySetInnerHTML={{ __html: content.body }} />
              </section>
            ))}
          </article>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    orderings: 'first_publication_date desc',
    pageSize: 1,
  });

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
  // TODO
};

export const getStaticProps: GetStaticProps = async ({ params }: any) => {
  const { slug } = params;

  const prismic = getPrismicClient({});

  const response = await prismic.getByUID('posts', slug);

  const postsResponse = await prismic.getByType('posts', {
    orderings: 'first_publication_date desc',
  });

  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      title: post.data.title,
    };
  });

  const pageActual = posts.findIndex(post => post.slug === slug);
  let pagesNextAndPrevious;
  if (pageActual > 0 && pageActual < posts.length - 1) {
    pagesNextAndPrevious = {
      previous: posts[pageActual - 1],
      next: posts[pageActual + 1],
    };
  }
  if (pageActual === 0) {
    pagesNextAndPrevious = {
      previous: false,
      next: posts[pageActual + 1],
    };
  }

  if (pageActual === posts.length - 1) {
    pagesNextAndPrevious = {
      previous: posts[pageActual - 1],
      next: false,
    };
  }

  return {
    props: {
      post: response,
      pages: pagesNextAndPrevious,
    },
  };
};
