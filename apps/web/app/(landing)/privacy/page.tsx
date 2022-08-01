import { Metadata } from "next";
import { allLegalPosts } from "contentlayer/generated";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy - Mail Pilot",
  description: "Privacy Policy - Mail Pilot",
};

export default function Terms() {
  const post = allLegalPosts.find(
    (post) => post._raw.flattenedPath === "privacy"
  );
  if (!post) throw new Error(`Post not found for slug: "privacy"`);

  return (
    <LegalPage
      date={post.updatedAt}
      title={post.title}
      content={post.body.html}
    />
  );
}
