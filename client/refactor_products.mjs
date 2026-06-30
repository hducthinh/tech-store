import { Project } from "ts-morph";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const project = new Project({
    compilerOptions: { allowJs: true }
  });

  project.addSourceFilesAtPaths("src/**/*.js");
  project.addSourceFilesAtPaths("src/**/*.jsx");

  const targetProducts = path.resolve(__dirname, "src/features/products");
  const targetProductsComponents = path.resolve(__dirname, "src/features/products/components");

  const productPages = ["ProductDetail.jsx", "CategoryPage.jsx"];

  for (const pageName of productPages) {
    const file = project.getSourceFile(`src/pages/${pageName}`);
    if (file) {
      console.log(`Moving ${pageName}...`);
      file.moveToDirectory(targetProducts);
    }
  }

  const productComponents = project.getSourceFiles("src/components/products/**/*");
  console.log(`Moving ${productComponents.length} product components...`);
  for (const file of productComponents) {
    // preserve folder structure inside components/products
    const currentPath = file.getFilePath();
    const relativePath = currentPath.split("components/products/")[1];
    const newDir = path.dirname(path.resolve(__dirname, `src/features/products/components/${relativePath}`));
    file.moveToDirectory(newDir);
  }

  await project.save();
  console.log("Done!");
}
main().catch(console.error);
