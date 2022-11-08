console.log("hello world");
var signatureInput = document.querySelector("input[name=signature]");
var canvas = document.getElementById("signature-pad");
function resizeCanvas() {
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
}
window.onresize = resizeCanvas;
resizeCanvas();
var signaturePad = new SignaturePad(canvas, {
    backgroundColor: "rgb(250,250,250)",
});
document.getElementById("clear").addEventListener("click", function () {
    signaturePad.clear();
});
document.getElementById("submit").addEventListener("click", function () {
    canvasString = canvas.toDataURL();
    signatureInput.value = canvasString;
});
/* canvasString = canvas.toDataURL();
console.log(signatureInput); */
/* signatureInput.value = canvasString;
console.log(signatureInput.value); */