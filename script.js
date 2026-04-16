const video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");
const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("webcamButton");
const submitIdCard = document.getElementById("submitIdCard");
const cameraViewTitle = document.getElementById("cameraViewTitle");
const detectedCardTitle = document.getElementById("detectedCardTitle");
const containerCamera = document.getElementsByClassName("containerCamera");

// cameraViewTitle.style.display ="none";
detectedCardTitle.style.display = "none";
submitIdCard.style.display = "none";

function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener("click", enableCam);

  enableWebcamButton,
    addEventListener("click", () => {
      enableCam();
    });
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

function enableCam(event) {
  if (!model) {
    alert("Cargando modelo de tensorFlow");
    return;
  }

  if (event && event.target) {
    event.target.classList.add("removed");
  }

  const constraints = {
    video: true,
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

var model = true;
demosSection.classList.remove("invisible");

var model = undefined;

cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  demosSection.classList.remove("invisible");
});

var children = [];
console.log(children);

function trimCanvas(c) {
  var ctx = c.getContext("2d", { willReadFrequently: true }),
    copy = document.createElement("canvas").getContext("2d"),
    pixels = ctx.getImageData(0, 0, c.width, c.height),
    l = pixels.data.length,
    i,
    bound = {
      top: null,
      left: null,
      right: null,
      bottom: null,
    },
    x,
    y;

  for (i = 0; i < l; i += 4) {
    if (pixels.data[i + 3] !== 0) {
      x = (i / 4) % c.width;
      y = ~~(i / 4 / c.width);

      if (bound.top === null) {
        bound.top = y;
      }

      if (bound.left === null) {
        bound.left = x;
      } else if (x < bound.left) {
        bound.left = x;
      }

      if (bound.right === null) {
        bound.right = x;
      } else if (bound.right < x) {
        bound.right = x;
      }

      if (bound.bottom === null) {
        bound.bottom = y;
      } else if (bound.bottom < y) {
        bound.bottom = y;
      }
    }
  }

  var trimHeight = bound.bottom - bound.top,
    trimWidth = bound.right - bound.left,
    trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

  copy.canvas.width = trimWidth;
  copy.canvas.height = trimHeight;
  copy.putImageData(trimmed, 0, 0);

  return copy.canvas;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function submitCardFunc(dataurl) {
  if (dataurl) {
    console.log(dataurl);
    console.log("ID card submitted successfully!");
  } else {
    console.log("Please try again thank you!");
  }
}

function predictWebcam() {
  detectedCardTitle.style.display = "block";

  const targetObj = "book";
  const seccondTargetObj = "person";
  let exitCode = 0;

  model.detect(video).then(async function (predictions) {
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      if (predictions.length === 2) {
        console.log(predictions);

        for (let index = 0; index < predictions.length - 1; index++) {
          if (
            predictions[index].class === targetObj &&
            predictions[index + 1].class === seccondTargetObj
          ) {
            if (
              predictions[index].score >= 0.8 &&
              predictions[index + 1].score >= 0.75
            ) {
              let dx = predictions[0].bbox[0];
              let dy = predictions[0].bbox[1];
              let dw = predictions[0].bbox[2];
              let dh = predictions[0].bbox[3];

              const p = document.createElement("p");

              p.style =
                "margin-left: " +
                predictions[n].bbox[0] +
                "px; margin-top: " +
                (predictions[n].bbox[1] - 10) +
                "px; width: " +
                (predictions[n].bbox[2] - 10) +
                "px; top: 0; left: 0;";

              const highlighter = document.createElement("div");
              highlighter.setAttribute("class", "highlighter");
              highlighter.style =
                "left: " +
                predictions[n].bbox[0] +
                "px; top: " +
                predictions[n].bbox[1] +
                "px; width: " +
                predictions[n].bbox[2] +
                "px; height: " +
                predictions[n].bbox[3] +
                "px;";

              if (highlighter) {
                liveView.appendChild(highlighter);
                liveView.appendChild(p);
                children.push(highlighter);
                children.push(p);

                let canvas = document.getElementById("canva");
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, dx, dy, dw, dh, 0, 0, dw, dh);

                var trimmedCanvas = trimCanvas(canvas);

                let image_data_url = trimmedCanvas.toDataURL("image/png");

                submitIdCard.style.display = "none";
                console.log(image_data_url)
                window.parent.postMessage(image_data_url, '*');
                return; // Termina la ejecución de la función después de la captura exitosa
              }
            }
            exitCode = 1;
          }
        }
      }
    }

    window.requestAnimationFrame(predictWebcam);
  });
}
