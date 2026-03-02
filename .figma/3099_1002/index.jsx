import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.backgroundHorizontal}>
      <div className={styles.linkOutline}>
        <div className={styles.link}>
          <p className={styles.aBackToSeries}>← Back to Series</p>
        </div>
      </div>
      <div className={styles.autoWrapper}>
        <p className={styles.tIedbyfate}>TIED BY FATE</p>
        <p className={styles.episode1Duration6Min}>
          Episode 1 · Duration: 6 min · 1 of 30
        </p>
      </div>
    </div>
  );
}

export default Component;
