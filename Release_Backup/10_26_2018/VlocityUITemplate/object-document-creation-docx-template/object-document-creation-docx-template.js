baseCtrl.prototype.setDocXIPScope = function(scp) {
    'use strict';
    var afterSlash = '/' + window.location.href.split('.com/')[1].split('/')[0];
    window.VlocOmniSI = scp;
    if (afterSlash === 'apex') {
        afterSlash = '';
    }
    scp.applyCallResp({
        urlPrefix: window.location.origin + afterSlash
    });

    window.addEventListener('message', function(event) {
        if (event.data && event.data.constructor === Object && event.data.hasOwnProperty('docGenContentVersionId')) {
            window.VlocOmniSI.applyCallResp(event.data);
        }
    }, false);
};