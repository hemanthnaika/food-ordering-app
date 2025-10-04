import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CartButton = () => {
  const { getTotalItems } = useCartStore();
  const totalItem = getTotalItems();
  return (
    <TouchableOpacity onPress={() => router.push("/cart")} className="cart-btn">
      <Image source={images.bag} className="size-5" resizeMode="contain" />
      {totalItem > 0 && (
        <View className="cart-badge">
          <Text className="small-bold text-white">{totalItem}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CartButton;
