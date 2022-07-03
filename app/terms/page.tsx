import { Metadata } from "next";
import { allLegalPosts } from "contentlayer/generated";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - Mail Pilot",
  description: "Terms of Service - Mail Pilot",
};

export default function Terms() {
  const post = allLegalPosts.find(
    (post) => post._raw.flattenedPath === "legal/terms"
  );
  if (!post) throw new Error(`Post not found for slug: "terms"`);

  return (
    <LegalPage
      date={post.updatedAt}
      title={post.title}
      content={post.body.html}
    />
  );
}
