function PadDigits(n, totalDigits){
    n = n.toString(); 
    var pd = ''; 
    if (totalDigits > n.length) 
    { 
        for (i=0; i < (totalDigits-n.length); i++) 
        { 
            pd += '0'; 
        } 
    } 
    return pd + n.toString(); 
}

/*
toFormat: number that needs to be formatted.
numberDecimals: number of decimal places that the number should have.
thousandsSeparator: the thousands separator.
decimalPoint: decimal point. period or comma.
curr1: currency symbol left of number.
curr2: currency symbol right of number.
n1: negative symbol left of number.
n2: negative symbol right of number.
*/
function formatNumber(toFormat,numberDecimals,thousandsSeparator,decimalPoint,curr1,curr2,n1,n2) {
    var round = Math.round(toFormat * Math.pow(10,numberDecimals));
    if (round >= 0) n1=n2='';
    var splitted = (''+Math.abs(round)).split('');
    var lengthWithoutDec = splitted.length - numberDecimals;
    if (lengthWithoutDec<0) lengthWithoutDec--;
    for(var i=lengthWithoutDec;i<0;i++) splitted.unshift('0');
    if (lengthWithoutDec<0) lengthWithoutDec = 1;
    splitted.splice(lengthWithoutDec, 0, decimalPoint);
    if(splitted[0] == decimalPoint) splitted.unshift('0');
    while (lengthWithoutDec > 3) {
        lengthWithoutDec-=3;
        splitted.splice(lengthWithoutDec,0,thousandsSeparator);
    }
    var result = curr1+n1+splitted.join('')+n2+curr2;
    return result;
}