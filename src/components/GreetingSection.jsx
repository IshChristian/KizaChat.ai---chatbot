import React from "react";

export default function GreetingSection({ name }) {
  return (
    <div className="text-center space-y-2 mb-6">
      <img
        src="/assets/logo-gorilla.png"
        alt="Logo"
        className="mx-auto w-16 h-16"
      />
      <h1 className="text-2xl sm:text-3xl font-semibold">
        Hi there,{" "}
        <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
          {name}
        </span>
      </h1>
      <h2 className="text-lg sm:text-xl font-medium">
        What{" "}
        <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-blue-500 bg-clip-text text-transparent">
          would you like to know?
        </span>
      </h2>
    </div>
  );
}