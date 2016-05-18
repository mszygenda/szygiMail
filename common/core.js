module.exports = {
    getConfig: function () {
        return {
            idpEmailMockService: {
                url: "http://10.124.107.11:8888"
            },
            httpClient: {
                proxy: "http://10.224.23.8:3128"
            }
        }
    }
}