import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <>
      <header className={styles.container}>
        <div className={styles.contentHeader}>
          <Link href="/">
            <a href="/">
              <img src="/images/logo.svg" alt="logo" />
            </a>
          </Link>
        </div>
      </header>
    </>
  );
}
