import React, { useState } from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { METRIC_CONFIG } from "../../data/config/MetricConfig";
import { MultiMapCard, MultiMapCardProps } from "../MultiMapCard";
import { Fips, USA_FIPS } from "../../data/utils/Fips";
import { StoryWrapper } from "../../storybook/StoryWrapper";

export default {
  title: "Cards/MultiMapCard",
  component: MultiMapCard,
  decorators: [StoryWrapper],
} as Meta;

const MultiMapCardStateful = (args: any) => {
  const [fips, setFips] = useState<Fips>(new Fips(USA_FIPS));
  return (
    <MultiMapCard
      {...args}
      fips={fips}
      updateFipsCallback={(fips: Fips) => {
        setFips(fips);
      }}
    />
  );
};

const Template: Story<MultiMapCardProps> = (args) => (
  <MultiMapCardStateful {...args} />
);

export const CovidPercentShareMap = Template.bind({});
CovidPercentShareMap.args = {
  metricConfig: METRIC_CONFIG["covid"][0].metrics["pct_share"],
  currentBreakdown: "all",
};

export const CopdPer100kMap = Template.bind({});
CopdPer100kMap.args = {
  metricConfig: METRIC_CONFIG["copd"][0].metrics["per100k"],
  currentBreakdown: "all",
};
