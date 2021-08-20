// TODO: generate using html template engine
const generateFromTemplate = function(
  name,
  newViews,
  newClones,
  newForks,
  repo1,
  repo2,
  repo3,
  repo4,
  repo5
) {
  return `
  <center>
    <table style="table-layout: fixed; width: 500px; border-top: 5px solid black; background-color: #dfdfdf;padding: 20px;">
        <tr style="font-size: 14px;">
            <td colspan="3"> GHV - GitHub Views</td>
        </tr>
        <tr>
            <td colspan="3"><hr/></td>
        </tr>
        
        <tr style="font-size: 25px;">
            <td colspan="3"> Your month in review</td>
        </tr>
        <tr>
            <td><br /></td>
        </tr>
        <tr>
            <td colspan="3"><b>${name}</b>, this is a summary of for the traffic of your repos in the last 30 days.</td>
        </tr>
        <tr>
            <td><br /></td>
        </tr>
        <tr>
            <td colspan="1" style="font-size:20px; text-align: center;">${newViews}</td>
            <td colspan="1" style="font-size:20px; text-align: center;">${newClones}</td>
            <td colspan="1" style="font-size:20px; text-align: center;">${newForks}</td>
        </tr>
        <tr>
            <td style="text-align:center">New Views</td>
            <td style="text-align:center">New Clones</td>
            <td style="text-align:center">New Forks</td>
        </tr>

        <tr>
            <td><br /></td>
        </tr>

        <tr>
            <td colspan="3">Top repositories in the past month</td>
        </tr>
        <tr>
            <td colspan="3">1. ${repo1}</td>
        </tr>
        <tr>
            <td colspan="3">2. ${repo2}</td>
        </tr>
        <tr>
            <td colspan="3">3. ${repo3}</td>
        </tr>
        <tr>
            <td colspan="3">4. ${repo4}</td>
        </tr>
        <tr>
            <td colspan="3">5. ${repo5}</td>
        </tr>
        
    </table>
  </center>
  `;
};

module.exports = generateFromTemplate;
