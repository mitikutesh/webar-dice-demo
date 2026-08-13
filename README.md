# WebAR Dice Demo

A QR-launched **image-tracking WebAR** dice game. It no longer depends on WebXR `immersive-ar` surface placement.

## How it works

1. Open the HTTPS game URL from the QR code.
2. Tap **Start WebAR** and allow camera access.
3. Point the phone at the printed AR target shown on the start screen.
4. When the target is recognized, a 3D dice appears over it.
5. Tap **ROLL DICE**.

The AR layer uses MindAR image tracking with A-Frame. MindAR is an open-source WebAR SDK for image tracking and face tracking. See https://www.mindar.org/ and https://hiukim.github.io/mind-ar-js-doc/ for the underlying project and documentation.

## Target image

The demo currently uses the official MindAR example target so the project can be tested immediately without compiling a custom `.mind` target. The start screen includes the target image and an **Open target image** link.

For production, replace the target with your own branded card/game-board artwork and compile a matching `.mind` target.

## GitHub Pages

This is a static site. Keep GitHub Pages enabled on `main` / root. HTTPS is required for camera access.

## Compatibility

Image-tracking WebAR is different from native WebXR surface AR: the camera feed and image tracking are handled by the WebAR SDK, which makes this approach suitable for browsers where `immersive-ar` is unavailable. Always test the exact target phones before a public event.
