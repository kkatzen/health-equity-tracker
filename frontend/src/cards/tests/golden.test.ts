import resemblejs from "resemblejs";
import compareImages from "resemblejs/compareImages";
import * as fs from "fs-extra";
import path from "path";

describe("GOlden tests", () => {
  beforeEach(() => {});

  test("State and Race Breakdown", async () => {
    const file1 = await fs.readFile(
      "/Users/kristak/Documents/GitHub/health-equity-tracker-fork/health-equity-tracker/frontend/public/img/het-screen-1.png"
    );
    const file2 = await fs.readFile(
      "/Users/kristak/Documents/GitHub/health-equity-tracker-fork/health-equity-tracker/frontend/public/img/het-screen-2.png"
    );
    const options = {
      output: {
        errorColor: {
          red: 255,
          green: 0,
          blue: 255,
        },
        errorType: "movement",
        transparency: 0.3,
        largeImageThreshold: 1200,
        useCrossOrigin: false,
        outputDiff: true,
      },
      scaleToSameSize: true,
      ignore: "antialiasing",
    };

    var diff = resemblejs(file1)
      .compareTo(file2)
      .onComplete((data: any) => {
        console.log("data");
        /*
	{
	  misMatchPercentage : 100, // %
	  isSameDimensions: true, // or false
	  dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
	  getImageDataUrl: function(){}
	}
	*/
      });

    // The parameters can be Node Buffers
    // data is the same as usual with an additional getBuffer() function
    const data = await compareImages(file1, file2, options);
    console.log(data.rawMisMatchPercentage);

    await fs.writeFile("./kristapurplemountain.png", data.getBuffer());
  });
});
