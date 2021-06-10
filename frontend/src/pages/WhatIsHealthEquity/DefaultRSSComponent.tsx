import React, { FunctionComponent } from "react";
import rssEnhancer, { InjectionRSSProps } from "react-rss";
import Grid from "@material-ui/core/Grid";
import styles from "./WhatIsHealthEquityPage.module.scss";
import Typography from "@material-ui/core/Typography";

const DefaultRSSComponent: FunctionComponent<
  { label: string } & InjectionRSSProps
> = (props) => (
  <Grid
    container
    className={styles.NewsAndStoriesRow}
    direction="row"
    justify="center"
  >
    {props.rss.items.map((item) => {
      console.log(item);
      return (
        <Grid
          item
          xs={12}
          sm={6}
          lg={4}
          className={styles.ResourceItem}
          style={{ padding: "15px" }}
        >
          <Typography className={styles.ResourcesHeaderText} variant="h1">
            {item.title}
          </Typography>
          <p>
            <i>published on {item.pubDate}</i>
          </p>
          <p className={styles.MainResourceSubtitleText}>
            <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
          </p>
        </Grid>
      );
    })}
  </Grid>
);

export default rssEnhancer(
  DefaultRSSComponent,
  "https://satcherinstitute.org/feed/"
);
