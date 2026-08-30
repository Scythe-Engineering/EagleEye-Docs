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
              <div className={styles.statValue}>1. Flash the image</div>
              <div className={styles.statLabel}>
                Boot it, then open eagleeye.local:5001
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>2. Set up the camera</div>
              <div className={styles.statLabel}>
                Use the setup wizard when your release provides it
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>3. Verify pose</div>
              <div className={styles.statLabel}>
                Check 3D View and the NetworkTables keys before driving
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const showcaseItems = [
  {
    title: 'See live detections',
    body: 'Open an operation to inspect its output while the pipeline runs.',
    image: '/img/ui-screenshots/apriltag-detection-frame.png',
    alt: 'Live camera frame with detected AprilTags marked',
    to: '/docs/user-guide/user-interface',
  },
  {
    title: 'Edit a custom graph',
    body: 'Use the pipeline editor for manual setup and custom processing.',
    image: '/img/ui-screenshots/pipeline-setup/apriltag-input-detection-closeup.png',
    alt: 'AprilTag operations connected in the Pipeline tab',
    to: '/docs/user-guide/advanced-pipeline-editor',
  },
  {
    title: 'Check pose on the field',
    body: 'The 3D view makes bad camera placement and pose jumps obvious.',
    image: '/img/ui-screenshots/3d-view-tab.png',
    alt: 'Robot pose shown on the field in the 3D View tab',
    to: '/docs/user-guide/verify-and-tune',
  },
  {
    title: 'Calibrate in the browser',
    body: 'See detected ChArUco corners and coverage while collecting calibration frames.',
    image: '/img/ui-screenshots/calibration-live-coverage.png',
    alt: 'ChArUco detections and captured corner coverage in the calibration tool',
    to: '/docs/user-guide/calibrate-intrinsics#4-capture-frames',
  },
  {
    title: 'Run the device',
    body: 'Connect Wi-Fi, read logs, restart the backend, or use the built-in terminal.',
    image: '/img/ui-screenshots/wifi-manager.png',
    alt: 'Wi-Fi Network Manager opened from the Settings tab',
    to: '/docs/user-guide/connect-wifi#connect-from-the-web-ui',
  },
  {
    title: 'See what each operation sees',
    body: 'Tune preprocessing beside its live output, then keep the graph running.',
    image: '/img/ui-screenshots/pipeline-setup/apriltag-temporal-live-view.png',
    alt: 'Temporal Acceleration settings beside its live processed frame',
    to: '/docs/user-guide/temporal-acceleration#2-configure-it',
  },
];

function ShowcaseItem({item}) {
  const imageUrl = useBaseUrl(item.image);
  return (
    <Link
      className={clsx(styles.showcaseCard, item.className)}
      to={item.to}>
      <div className={styles.showcaseFrame}>
        <img src={imageUrl} alt={item.alt} loading="lazy" />
      </div>
      <div className={styles.showcaseCopy}>
        <Heading as="h3">{item.title}</Heading>
        <p>{item.body}</p>
      </div>
    </Link>
  );
}

function HomepageShowcase() {
  return (
    <section className={styles.screenshotSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          See what the system is doing
        </Heading>
        <p className={styles.sectionBody}>
          Open <code>http://eagleeye.local:5001</code> from a laptop on the
          robot network. The UI covers camera setup, live status, device controls, and
          advanced pipeline editing.
        </p>
        <div className={styles.showcaseGrid}>
          {showcaseItems.map((item) => (
            <ShowcaseItem item={item} key={item.title} />
          ))}
        </div>
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
        <HomepageShowcase />
      </main>
    </Layout>
  );
}
