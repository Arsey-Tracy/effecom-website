import assert from "node:assert/strict";
import { test } from "node:test";
import { apiErrorMessage } from "../lib/api-errors.ts";
import {
  captionDownloadPath,
  isCaptionVersionConflict,
  renderSrt,
  renderVtt,
  uploadProgressPercent,
  validateCaptionSegments,
  validateVideoFile,
} from "../lib/caption-workflow.ts";

test("video upload validation checks allowed extensions and size", () => {
  assert.equal(validateVideoFile({ name: "clip.MP4", size: 10 }, 1), null);
  assert.match(
    validateVideoFile({ name: "clip.wav", size: 10 }, 1),
    /Choose a video/,
  );
  assert.match(
    validateVideoFile({ name: "clip.mp4", size: 1_048_577 }, 1),
    /1 MB or smaller/,
  );
});

test("upload progress reports determinate, bounded percentages", () => {
  assert.equal(uploadProgressPercent(1, 4), 25);
  assert.equal(uploadProgressPercent(8, 4), 100);
  assert.equal(uploadProgressPercent(1, 0), null);
  assert.equal(uploadProgressPercent(1, 4, false), null);
});

test("caption validation rejects invalid times, ordering, and blank text", () => {
  const valid = [{ id: "a", start: 0, end: 1, text: "Hello" }];
  assert.equal(validateCaptionSegments(valid, 2), null);
  assert.match(
    validateCaptionSegments([{ ...valid[0], end: 3 }], 2),
    /valid times/,
  );
  assert.match(
    validateCaptionSegments([
      { id: "a", start: 1, end: 2, text: "Later" },
      { id: "b", start: 0, end: 1, text: "Earlier" },
    ], 2),
    /chronological/,
  );
  assert.match(
    validateCaptionSegments([{ ...valid[0], text: " " }], 2),
    /cannot be empty/,
  );
});

test("saved-caption export paths and subtitle timestamps are correct", () => {
  const segments = [{ id: "a", start: 1.25, end: 2, text: " Hello\nworld " }];
  assert.equal(
    captionDownloadPath("video/id", "srt"),
    "/api/v1/videos/video%2Fid/captions/download/?format=srt",
  );
  assert.equal(
    renderSrt(segments),
    "1\n00:00:01,250 --> 00:00:02,000\nHello\nworld\n",
  );
  assert.equal(
    renderVtt(segments),
    "WEBVTT\n\n1\n00:00:01.250 --> 00:00:02.000\nHello\nworld\n",
  );
});

test("save conflict and API failure helpers preserve safe messages", () => {
  assert.equal(isCaptionVersionConflict({ status: 409 }), true);
  assert.equal(isCaptionVersionConflict({ status: 500 }), false);
  assert.equal(
    apiErrorMessage({
      error: {
        message: "Request validation failed.",
        details: { file: ["Unsupported video."] },
      },
    }, 400),
    "Request validation failed. file: Unsupported video.",
  );
});
