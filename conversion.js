(function(root, xmlToJson) {
    root.convertXmlToJson = xmlToJson();
}(this, function() {

    "use strict";
    var keyCounter = 0;

    function convertXmlToJson(x) {
        let index = x.indexOf("?>");
        while (index >= 0) {
            x = x.substr(index + 2);
            index = x.indexOf("?>");
        }
        let mock = x.replace(/(\r\n|\n|\r)/gm, "")
            .replace(/\t/g, "");

        mock = mock.replace(/ /g, "__")
            .replace(/(__+)/g, "__")
            .replace(/>__/g, ">")
            .replace(/>__/g, ">")
            .replace(/__</g, "<");

        mock = mock.replace(/=/g, "Z_eQuAlItY_Z")
            .replace(/\./g, "Z_dOt_Z")
            .replace(/-/g, "Z_hIfEn_Z")
            .replace(/:/g, "Z_cOlOn_Z");

        mock = mock.replace(/"/g, "Z_CoMmA_Z")
            .replace(/'/g, 'Z_cOmMa_Z')
            .replace(/\(/g, "Z_oPeNiNGrOuNd_Z")
            .replace(/\)/g, "Z_ClOsEiNGrOuNd_Z");

        mock = mock.replace(/\[/g, "Z_oPeNiNGsQuArE_Z")
            .replace(/\]/g, "Z_ClOsEiNGsQuArE_Z")
            .replace(/@/g, "Z_AtrAte_Z")
            .replace(/#/g, "Z_hAsH_Z");

        mock = mock.replace(/<\//g, "}")
            .replace(/</g, "{\"")
            .replace(/\//g, "Z_sLaSh_Z");

        mock = mock.replace(/([a-zA-Z0-9]+)>+}+([a-zA-Z0-9]+)/g, function($1, $2) {
            let y = $1.split(">}");
            if (y[0] === y[1]) {
                return y[1] + ">Z_eMpTy_Z}" + y[1];
            } else {
                return $1;
            }
        })
        mock = addInvertedCommaToKey(mock);
        mock = addInvertedCommaToValue(mock);
        mock = removeParenthesis(mock);
        mock = mock.replace(/:__/g, ":")
            .replace(/Z_hIfEn_Z/g, "-")
            .replace(/Z_dOt_Z/g, '.')
            .replace(/Z_cOmMa_Z/g, "'")
            .replace(/Z_cOlOn_Z/g, ":")
            .replace(/Z_sLaSh_Z/g, "/")
            .replace(/__/g, " ");

        mock = mock.replace(/Z_oPeNiNGrOuNd_Z/g, "(")
            .replace(/Z_ClOsEiNGrOuNd_Z/g, ")")
            .replace(/Z_oPeNiNGsQuArE_Z/g, "[")
            .replace(/Z_ClOsEiNGsQuArE_Z/g, "]");

        mock = mock.replace(/Z_AtrAte_Z/g, "@")
            .replace(/Z_eMpTy_Z/g, "")
            .replace(/Z_hAsH_Z/g, "#");

        try {
            mock = groupingKeys(JSON.parse(mock));
            mock = addProperty(mock);
            return mock;
        } catch (err) {
            console.error(err);
        }
    };

    function addProperty(value) {
        let keyArray = Object.keys(value);
        for (let i = 0; i < keyArray.length; i++) {
            if (typeof value[keyArray[i]] === "object") {
                addProperty(value[keyArray[i]]);
            }
            if (keyArray[i].indexOf("Z_eQuAlItY_Z") >= 0) {
                let param = keyArray[i].replace(/_+[0-9]+/g, "")
                    .replace(/Z_eQuAlItY_Z/g, "=");

                param = param.replace(/Z_CoMmA_Z/g, '"')
                    .replace(/Z_CoMmA_Z/g, '"')
                    .replace(/__/g, " ");

                let key = param.substr(0, param.indexOf(" "));
                param = param.substr(param.indexOf(" ") + 1);
                let paramsArray = param.split("\"_");
                if (Object.prototype.toString.call(value[keyArray[i]]) === "[object String]") {
                    let newObj = {};
                    newObj['#text'] = value[keyArray[i]];
                    for (let j = 0; j < paramsArray.length; j++) {
                        let paramData = paramsArray[j].split("=");
                        newObj["-" + paramData[0]] = paramData[1].substr(1, paramData[1].length - 2);
                    }
                    if (!value.hasOwnProperty(key)) {
                        value[key] = newObj;
                    } else {
                        if (Object.prototype.toString.call(value[key]) === "[object Array]") {
                            value[key].push(newObj);
                        } else if (Object.prototype.toString.call(value[key]) === "[object Object]") {
                            let oldData = value[key];
                            value[key] = [];
                            value[key].push(oldData);
                            value[key].push(newObj);
                        }
                    }
                    delete value[keyArray[i]];
                } else if (Object.prototype.toString.call(value[keyArray[i]]) === "[object Object]") {
                    if (!value.hasOwnProperty(key)) {
                        value[key] = value[keyArray[i]];;
                        for (let j = 0; j < paramsArray.length; j++) {
                            let paramData = paramsArray[j].split("=");
                            value[key]["-" + paramData[0]] = paramData[1].substr(1, paramData[1].length - 2);
                        }
                    } else {
                        if (Object.prototype.toString.call(value[key]) === "[object Object]") {
                            let objData = value[key];
                            value[key] = [];
                            value[key].push(objData);
                        }
                        let objData = value[keyArray[i]];
                        for (let j = 0; j < paramsArray.length; j++) {
                            let paramData = paramsArray[j].split("=");
                            objData["-" + paramData[0]] = paramData[1].substr(1, paramData[1].length - 2);
                        }
                        value[key].push(objData);
                    }
                    delete value[keyArray[i]];
                }
            }
        }
        return value;
    }

    function groupingKeys(value) {
        let keyArray = Object.keys(value),
            obtainedData;
        for (let i = 0; i < keyArray.length; i++) {
            let originalKey = keyArray[i].replace(/_+[0-9]+/g, "");
            if (typeof value[keyArray[i]] === "object") {
                obtainedData = groupingKeys(value[keyArray[i]]);
            } else {
                obtainedData = value[keyArray[i]];
            }
            if (value.hasOwnProperty(originalKey)) {
                if (Object.prototype.toString.call(value[originalKey]) === "[object Array]") {
                    value[originalKey].push(obtainedData);
                } else {
                    let previousData = value[originalKey];
                    value[originalKey] = [];
                    value[originalKey].push(previousData);
                    value[originalKey].push(obtainedData);
                }
            } else {
                value[originalKey] = obtainedData;
            }
            delete value[keyArray[i]];
        }
        return value;
    };

    function removeParenthesis(value) {
        let mock = value.replace(/{+("+[a-zA-Z0-9_]+"+:+"[a-zA-Z0-9_$-\.]+"+)}/g, '$1');
        mock = mock.replace(/:+("+[a-zA-Z0-9_]+"+:+)/g, ':{' + '$1');
        mock = mock.replace(/},{/g, '},').replace(/,{/g, ",");
        mock = mock.substr(0, mock.length - 1);
        mock = mock + "}";
        return mock;
    };

    function addInvertedCommaToValue(value) {
        let mock = value.replace(/:+([a-zA-Z0-9_:/$\.,@#$]+)}/g, ':\"' + '$1' + '\"}');
        return mock;
    };

    function addInvertedCommaToKey(value) {
        let mock = value.replace(/"+([a-zA-Z0-9_=\.]+)>/g, function($1) {
            keyCounter++;
            $1 = $1.substr(1, $1.length - 2);
            return '"' + $1 + '_' + keyCounter + '":';
        });
        mock = mock.replace(/}+[a-zA-Z0-9:_/]+>/g, "},");
        let flag = true;
        while (flag) {
            mock = mock.replace(/},}/g, "}}");
            if (mock.match(/},}/g) === null) {
                flag = false;
            }
        }
        return mock;
    };

    return convertXmlToJson;
}));
