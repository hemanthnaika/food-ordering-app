import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[];
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  console.log(`🧹 Clearing collection: ${collectionId}`);
  const list = await databases.listDocuments(
    appwriteConfig.databaseId,
    collectionId
  );

  await Promise.all(
    list.documents.map((doc) =>
      databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
    )
  );
  console.log(`✅ Cleared collection: ${collectionId}`);
}

async function clearStorage(): Promise<void> {
  console.log("🧹 Clearing storage bucket...");
  const list = await storage.listFiles(appwriteConfig.bucketId);

  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id)
    )
  );
  console.log("✅ Cleared storage bucket.");
}

async function uploadImageToStorage(imageUrl: string) {
  console.log(`📤 Using remote image URL: ${imageUrl}`);
  return imageUrl; // just return the URL
}

async function seed(): Promise<void> {
  console.log("🚀 Starting seeding process...");

  // 1. Clear all
  console.log("Step 1️⃣: Clearing old data...");
  await clearAll(appwriteConfig.categoriesCollectionId);
  await clearAll(appwriteConfig.customizationsCollectionId);
  await clearAll(appwriteConfig.menuCollectionId);
  await clearAll(appwriteConfig.menuCustomizationsCollectionId);
  await clearStorage();
  console.log("✅ Step 1 complete: Old data cleared.");

  // 2. Create Categories
  console.log("Step 2️⃣: Creating categories...");
  const categoryMap: Record<string, string> = {};
  for (const cat of data.categories) {
    console.log(`📦 Creating category: ${cat.name}`);
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      ID.unique(),
      cat
    );
    categoryMap[cat.name] = doc.$id;
    console.log(`✅ Category created: ${cat.name}`);
  }
  console.log("✅ Step 2 complete: Categories created.");

  // 3. Create Customizations
  console.log("Step 3️⃣: Creating customizations...");
  const customizationMap: Record<string, string> = {};
  for (const cus of data.customizations) {
    console.log(`⚙️ Creating customization: ${cus.name}`);
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.customizationsCollectionId,
      ID.unique(),
      {
        name: cus.name,
        price: cus.price,
        type: cus.type,
      }
    );
    customizationMap[cus.name] = doc.$id;
    console.log(`✅ Customization created: ${cus.name}`);
  }
  console.log("✅ Step 3 complete: Customizations created.");

  // 4. Create Menu Items
  console.log("Step 4️⃣: Creating menu items...");
  const menuMap: Record<string, string> = {};
  for (const item of data.menu) {
    console.log(`🍽️ Creating menu item: ${item.name}`);
    const uploadedImage = await uploadImageToStorage(item.image_url);

    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      ID.unique(),
      {
        name: item.name,
        description: item.description,
        image_url: uploadedImage,
        price: item.price,
        rating: item.rating,
        calories: item.calories,
        protein: item.protein,
        categories: categoryMap[item.category_name],
      }
    );

    menuMap[item.name] = doc.$id;
    console.log(`✅ Menu item created: ${item.name}`);

    // 5. Create menu_customizations
    console.log(`🔗 Linking customizations for: ${item.name}`);
    for (const cusName of item.customizations) {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCustomizationsCollectionId,
        ID.unique(),
        {
          menu: doc.$id,
          customizations: customizationMap[cusName],
        }
      );
      console.log(`   ↳ Linked customization: ${cusName}`);
    }
  }

  console.log("🎉 Seeding process completed successfully!");
}

export default seed;
