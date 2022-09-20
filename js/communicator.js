PODCAST.Xhr = function(callback, url, method, parameters, contentType, dataType, processData, format) {
    $.ajax({
        type: method,
        url: url,
        contentType: contentType ? contentType : (format === "multipart/form-data") ? false : "application/json",
        data: parameters,
        timeout: 60000,
        dataType: dataType ? dataType : (format === "multipart/form-data") ? false : "json",
        processData : (format === "multipart/form-data") ? false : true,
        //xhrFields: { withCredentials: false },
        success: function(data) {
            callback(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            callback({ responseCode : -2, response: errorThrown});
        }
    });

};
