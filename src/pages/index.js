import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className="hero__title">
            {siteConfig.title}
          </Heading>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/user-guide/overview">
              User Guide
            </Link>
            <Link className="button button--outline button--lg" to="/docs/codebase/overview">
              Codebase Docs
            </Link>
          </div>
          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>Pipelines</div>
              <div className={styles.statLabel}>Frame-first processing chain</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>Devices</div>
              <div className={styles.statLabel}>CPU · GPU · MX3 ready</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>WebUI</div>
              <div className={styles.statLabel}>Live views and pipeline editor</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
