const express = require('express')
const app = express()
const port = 7070

PROJECT_ID = 'my-project'
INSTANCE_ID = 'my-instance'
TABLE_ID = 'alasarr_tiles'

// Imports the Google Cloud client library
const Bigtable = require('@google-cloud/bigtable');
const tilebelt = require('@mapbox/tilebelt');

const bigtable = Bigtable({
    projectId: PROJECT_ID,
    keyFilename: 'credentials.json'
});

const instance = bigtable.instance(INSTANCE_ID);
const table = instance.table(TABLE_ID);
const filter = [ {  column: { cellLimit: 1, } }];

async function fetch_tile(tile) {
    const t = [tile.x, tile.y, tile.z ];
    const quadkey = tilebelt.tileToQuadkey(t);

    try {
        const [row] = await table.row(quadquey).get({filter});
        const tileData = row.data.default.mvt[0].value;
        console.log('here');
        return tileData;
    }
    catch(e) {
        return null;
    }
} 

app.get('/', (req, res) => res.send('Big Table tiler')); 
app.get('/tiles/:z/:x/:y', async (req, res) => {
    
    res.setHeader('Content-Type', 'application/x-protobuf');
    const tile = await fetch_tile(req.params);
    if (!tile) {
        res.status(204);
    }
    res.send(tile);
}); 

app.listen(port, () => console.log(`Example app listening on port ${port}!`))