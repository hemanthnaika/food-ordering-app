import { Redirect, Slot } from "expo-router";
import React from "react";

export default function _layout() {
  const isAuth = false;
  if (!isAuth) return <Redirect href="/sign-in" />;
  return <Slot />;
}
