import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.header}>
      <div className={styles.linkOutline}>
        <div className={styles.link}>
          <p className={styles.aBack}>← Back</p>
        </div>
      </div>
      <div className={styles.group272}>
        <img src="../image/mm8veuaq-u9hliql.svg" className={styles.background} />
        <p className={styles.goMaxShort}>GoMax Short</p>
      </div>
    </div>
  );
}

export default Component;
