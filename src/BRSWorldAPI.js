export class BRSWorldAPI {
  constructor(){
      this._baseUrl = "https://vn9e1kgqpb.execute-api.us-east-2.amazonaws.com/dev";
  }

  /**This uploads a brs buffer to the backend
   * @param {Buffer} brsBuff The brs save file
   */
  async uploadBuild(brsBuff){
    //Get the URL to upload to
    const data = await fetch(`${this._baseUrl}/build`, {
      method: 'PUT'
    });
    const dataJSON = await data.json();
    //Upload the file to the URL given
    await fetch(dataJSON.url, {
      method: 'PUT',
      body: brsBuff,
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-amz-acl': 'public-read'
      }
    });
  }

  /**Gets an array of a few random builds
   * @return {object} Object with .items for the new builds,
   * and TODO: .lastKey for the last evaluation
   */
  async getFeaturedBuilds() {
    const data = await fetch(`${this._baseUrl}/build`);
    return await data.json();
  }

  /**Returns a stored build by id
   * @param {string} id The id of the build to get
   * @returns {object} The build object
   */
  async getBuildById(id) {
    const data = await fetch(`${this._baseUrl}/build`, {
      method : 'POST',
      body: JSON.stringify({ id }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await data.json();
  }
}