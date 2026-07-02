import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "server/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Destructure-to-omit (e.g. `const { icon, ...rest } = x`) is intentional.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Avatars are external URLs (pravatar/Cloudinary); next/image isn't worth it here.
      "@next/next/no-img-element": "off",
    },
  },
  {
    // Recharts custom-tooltip `content` render props aren't usefully typed upstream.
    files: ["src/components/charts/**/*.tsx"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];

export default eslintConfig;
