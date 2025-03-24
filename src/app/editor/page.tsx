"use client";

import React from "react";
import CardGenerator from "@/components/CardGenerator";

const EditorPage = () => {
  return (
    <div className="container-fluid bg-photo-editor vh-100 d-flex flex-column justify-content-center items-center">
      <div
        className="row justify-content-center overflow-hidden w-full"
        style={{ alignItems: "center", height: "80vh" }}
      >
        <div
          className="col-12 col-md-10 col-lg-11 d-flex flex-column justify-center items-center h-full"
          style={{ height: "100%" }}
        >
          <CardGenerator />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
