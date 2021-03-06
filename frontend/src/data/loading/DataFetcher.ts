// Note: this Will be replaced with real API calls. Leaving data fetches
// untyped for now, but we should define types for the API calls once we
// establish the API types.

import { MapOfDatasetMetadata, Row } from "../utils/DatasetTypes";
import { FakeDatasetMetadataMap } from "../config/FakeDatasetMetadata";
import { Environment } from "../../utils/Environment";
import { DataFrame } from "data-forge";
import { GEOGRAPHIES_DATASET_ID } from "../config/MetadataMap";

type FileFormat = "json" | "csv";

export interface DataFetcher {
  /**
   * Fetches and returns the dataset associated with the provided ID.
   * @param datasetId The id of the dataset to load.
   */
  loadDataset(datasetId: string): Promise<Row[]>;

  /** Fetches and returns the MetadataMap for all datasets. */
  getMetadata(): Promise<MapOfDatasetMetadata>;
}

export class ApiDataFetcher implements DataFetcher {
  environment: Environment;

  constructor(environment: Environment) {
    this.environment = environment;
  }

  /**
   * Returns whether the dataset should be fetched as a static file from the
   * tmp directory. If false, fetches normally from the data server. This is
   * mainly for local development, though it may be used for in-progress
   * datasets that have not been fully productionized on the data server.
   * @param fileName The full name of the dataset file, including file
   *     extension.
   */
  private shouldFetchAsStaticFile(fileName: string) {
    return (
      (this.environment.deployContext === "development" &&
        !this.environment.getBaseApiUrl()) ||
      this.environment.forceFetchDatasetAsStaticFile(fileName)
    );
  }

  private getApiUrl() {
    return this.environment.getBaseApiUrl() + "/api";
  }

  /**
   * @param datasetName The ID of the dataset to request
   * @param format FileFormat for the request.
   */
  private getDatasetRequestPath(
    datasetName: string,
    format: FileFormat = "json"
  ) {
    const fullDatasetName = datasetName + "." + format;
    const basePath = this.shouldFetchAsStaticFile(fullDatasetName)
      ? "/tmp/"
      : this.getApiUrl() + "/dataset?name=";
    return basePath + fullDatasetName;
  }

  /**
   * @param datasetName The ID of the dataset to request
   * @param format FileFormat for the request.
   */
  private async fetchDataset(datasetName: string, format: FileFormat = "json") {
    const requestPath = this.getDatasetRequestPath(datasetName, format);
    const resp = await fetch(requestPath);
    if (resp.status !== 200) {
      throw new Error("Failed to fetch dataset. Status: " + resp.status);
    }
    return await resp.json();
  }

  // TODO build in retries, timeout before showing error to user.
  async loadDataset(datasetId: string): Promise<Row[]> {
    let result = await this.fetchDataset(datasetId);

    // Don't apply any of the below processing to the geography dataset.
    // Note that treating geographies as a normal dataset is a bit weird
    // because it doesn't fit the normal dataset model, so the dataset "rows"
    // aren't really rows. But in practice there aren't issues with it.
    if (datasetId === GEOGRAPHIES_DATASET_ID) {
      return result;
    }

    // TODO remove these once we figure out how to make BQ export integers as
    // integers
    if (datasetId.startsWith("acs_population")) {
      result = result.map((row: any) => {
        return { ...row, population: Number(row["population"]) };
      });
    }
    if (datasetId.startsWith("cdc_restricted")) {
      result = result.map((row: any) => {
        return {
          ...row,
          cases: Number(row["cases"]),
          hosp_y: Number(row["hosp_y"]),
          hosp_n: Number(row["hosp_n"]),
          hosp_unknown: Number(row["hosp_unknown"]),
          death_y: Number(row["death_y"]),
          death_n: Number(row["death_n"]),
          death_unknown: Number(row["death_unknown"]),
          population:
            row["population"] == null ? null : Number(row["population"]),
        };
      });
    } else if (datasetId.startsWith("acs_poverty")) {
      result = result.map((row: any) => {
        return {
          ...row,
          above_poverty_line: Number(row["above_poverty_line"]),
          below_poverty_line: Number(row["below_poverty_line"]),
        };
      });
    }

    // TODO - the server should drop ingestion_ts before exporting the file. At
    // that point we can drop this code.
    return new DataFrame(result)
      .dropSeries(["ingestion_ts"])
      .resetIndex()
      .toArray();
  }

  async getMetadata(): Promise<MapOfDatasetMetadata> {
    // TODO replace with real API call.
    return FakeDatasetMetadataMap;
  }
}
