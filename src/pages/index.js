import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
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
            Get EagleEye running on your robot
          </Heading>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/user-guide/overview">
              Start setup
            </Link>
          </div>
          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>1. Install</div>
              <div className={styles.statLabel}>
                One command on supported Debian 12 ARM64 hardware
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>2. Build a pipeline</div>
              <div className={styles.statLabel}>
                Discover and check cameras, then wire up detection in the web UI
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>3. Publish pose</div>
              <div className={styles.statLabel}>
                Publish robot pose to NetworkTables with a configured output node
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageScreenshot() {
  return (
    <section className={styles.screenshotSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Everything runs from the web UI
        </Heading>
        <p className={styles.sectionBody}>
          Open <code>http://&lt;device-ip&gt;:5001</code> from any laptop on the
          field network to build pipelines, watch live camera views, and confirm
          AprilTag pose is publishing — no redeploy, no rebuild.
        </p>
        <img
          className={styles.screenshot}
          src={useBaseUrl('/img/ui-screenshots/pipeline-tab.png')}
          alt="EagleEye Pipeline tab showing an AprilTag pipeline in the web UI"
          loading="lazy"
        />
        <Link className={styles.sectionLink} to="/docs/user-guide/verify-and-tune">
          Verify pose is publishing →
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="FRC vision, from install to robot pose"
      description="Install EagleEye, set up an AprilTag pipeline, and publish robot pose to NetworkTables.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageScreenshot />
      </main>
    </Layout>
  );
}
