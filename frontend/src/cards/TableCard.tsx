import React from "react";
import { TableChart } from "../charts/TableChart";
import { Alert } from "@material-ui/lab";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/MetricQuery";
import { Fips } from "../utils/madlib/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/Breakdowns";
import { CardContent } from "@material-ui/core";
import { MetricConfig, MetricId } from "../data/MetricConfig";
import RaceInfoPopoverContent from "./ui/RaceInfoPopoverContent";

export interface TableCardProps {
  fips: Fips;
  breakdownVar: BreakdownVar;
  metrics: MetricConfig[];
  nonstandardizedRace: boolean /* TODO- ideally wouldn't go here, could be calculated based on dataset */;
}

export function TableCard(props: TableCardProps) {
  // TODO need to handle race categories standard vs non-standard for covid vs
  // other demographic.
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    /*includeTotal=*/ true,
    props.nonstandardizedRace
  );
  let metricIds: MetricId[] = [];
  props.metrics.forEach((metricConfig) => {
    metricIds.push(metricConfig.metricId);
    if (metricConfig.populationComparisonMetric) {
      metricIds.push(metricConfig.populationComparisonMetric.metricId);
    }
  });
  const query = new MetricQuery(metricIds, breakdowns);

  return (
    <CardWrapper
      queries={[query]}
      title={
        <>{`${
          BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
        } in ${props.fips.getFullDisplayName()}`}</>
      }
      infoPopover={
        props.breakdownVar === "race_and_ethnicity" ? (
          <RaceInfoPopoverContent />
        ) : undefined
      }
    >
      {([queryResponse]) => {
        const dataset = queryResponse.data.filter(
          (row) => "Not Hispanic or Latino" !== row.race_and_ethnicity
        );

        return (
          <>
            {queryResponse.shouldShowMissingDataMessage(metricIds) && (
              <CardContent>
                <Alert severity="warning">
                  Missing data means that we don't know the full story.
                </Alert>
              </CardContent>
            )}
            {!queryResponse.dataIsMissing() && (
              <TableChart
                data={dataset}
                breakdownVar={props.breakdownVar}
                metrics={props.metrics}
              />
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
