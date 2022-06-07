import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai';
import { TbUser } from 'react-icons/tb';
import { RichText } from 'prismic-dom';
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

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Post | </title>
      </Head>
      <div className={styles.containerMain}>
        <img src={post.data.banner.url} alt="" />
        <div className={commonStyles.container}>
          <article className={commonStyles.containerContent}>
            <h1>{post.data.title}</h1>
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
              <div>
                <span>
                  <AiOutlineClockCircle
                    style={{ width: '20px', height: '20px' }}
                  />
                </span>
                <time>4 min</time>
              </div>
            </div>

            {post.data.content.map((content, index) => (
              <section key={`${index}-${content.heading}`} className={}>
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
  // const prismic = getPrismicClient({});
  // const posts = await prismic.getByType(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
  // TODO
};

export const getStaticProps: GetStaticProps = async ({ params }: any) => {
  const { slug } = params;

  const prismic = getPrismicClient({});

  const response = await prismic.getByUID('posts', slug);

  const postFormatted: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(c => {
        return {
          heading: c.healing ?? c.heading,
          body: RichText.asHtml(c.body),
        };
      }),
    },
  };

  return {
    props: {
      post: postFormatted,
    },
  };
};
