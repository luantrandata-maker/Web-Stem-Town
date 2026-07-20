const fs = require("fs");
const path = require("path");

// Reads every .json file in a folder and returns their parsed contents,
// sorted by an optional numeric "order" field. Using plain Node fs here
// (instead of Eleventy's template glob API) means this works reliably
// regardless of which file extensions are registered as template formats.
function loadJsonFolder(relativeDir) {
  const dir = path.join(__dirname, relativeDir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

module.exports = function (eleventyConfig) {
  // Static passthroughs
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });

  // Collections driven by JSON content files (edited via Decap CMS)
  eleventyConfig.addCollection("team", () => loadJsonFolder("src/content/team"));
  eleventyConfig.addCollection("courses", () => loadJsonFolder("src/content/courses"));
  eleventyConfig.addCollection("testimonials", () => loadJsonFolder("src/content/testimonials"));
  eleventyConfig.addCollection("partners", () => loadJsonFolder("src/content/partners"));

  // Policies stay as real Eleventy template items (they're .md) so we get
  // rendered HTML via item.templateContent for the /chinh-sach/ pages.
  eleventyConfig.addCollection("policies", (api) =>
    api
      .getFilteredByGlob("src/content/policies/*.md")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
  );

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  // Singleton page-content files (edited as single entries in Decap CMS)
  eleventyConfig.addGlobalData("home", () => require("./src/content/home.json"));
  eleventyConfig.addGlobalData("about", () => require("./src/content/about.json"));
  eleventyConfig.addGlobalData("contact", () => require("./src/content/contact.json"));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
