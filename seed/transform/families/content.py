"""Content-family pages and collection entries from the original TinaCMS documents."""
from __future__ import annotations

import base64
import os
from datetime import datetime

import lib


LEGAL_PAGES = (
    ("privacy-policy", "privacyPolicy"),
    ("terms-of-use", "termsOfUse"),
    ("cookies-policy", "cookiesPolicy"),
)

POST_TEMPLATE = {
    "sharePrompt": "Like what you read? Share with a friend!",
    "subscriptionEyebrow": "SUBSCRIPTION",
    "subscriptionHeading": "Subscribe to our Newsletter",
    "subscriptionPlaceholder": "Email address",
    "relatedEyebrow": "RELATED BLOG POSTS",
    "relatedMessage": "Exciting updates and new blog content are on the horizon. Stay tuned!",
}


def _connection_records(page_key: str, connection_name: str):
    """Yield (original filename slug, Tina blog/news document) from a connection."""
    connection = lib.load_docs(page_key).get(connection_name) or {}
    for edge in connection.get("edges") or []:
        node = edge.get("node") or edge
        cursor = edge.get("cursor") or ""
        try:
            source_path = base64.b64decode(cursor).decode("utf-8")
            original_slug = os.path.splitext(os.path.basename(source_path))[0]
        except Exception:
            original_slug = ""
        yield original_slug, node.get("blogList") or node


def _date(value: str | None) -> str | None:
    """Strapi date fields take YYYY-MM-DD; Tina records hold ISO datetimes."""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).date().isoformat()
    except ValueError:
        return value[:10]


def _filter_groups() -> list[dict]:
    """Editable category/keyword tabs from the original keyWordsConnection query."""
    source = lib.load_docs("company__blog").get("keyWordsConnection") or {}
    groups = []
    for edge in source.get("edges") or []:
        category = edge.get("node") or edge
        options = []
        for item in category.get("categoryKeyWords") or []:
            sub = item.get("subCategories") or {}
            label = lib.clean(sub.get("name")) or ""
            if label:
                options.append({"label": label, "value": label})
        label = lib.clean(category.get("name")) or ""
        if label:
            groups.append({"label": label, "options": options})
    return groups


def _blog_posts() -> list[dict]:
    """All Tina blogs as blog-post entries; slug preserves the original URL segment."""
    posts = []
    article_keys = {
        "Privacy Policy": "company__blog__Privacy_Policy",
        "Privacy Policy 4": "company__blog__Privacy_Policy_4",
    }
    for index, (original_slug, record) in enumerate(_connection_records("company__blog", "blogsSectionConnection")):
        category = record.get("category") or {}
        keyword = record.get("keyWord") or {}
        author = record.get("author") or {}
        title = lib.clean(record.get("title")) or ""
        slug = original_slug or lib.slug(title)
        page_key = article_keys.get(slug)
        seo = lib.seo(page_key, title) if page_key else lib.seo("company__blog", title)
        posts.append({
            "title": title,
            "slug": slug,
            "excerpt": lib.clean(record.get("description")) or "",
            "cover": lib.media(record.get("image"), lib.clean(record.get("heading")) or "Blog"),
            "label": lib.clean(record.get("heading")) or "Blog",
            "tag": lib.clean(keyword.get("name")) or "",
            "categoryGroup": lib.clean(category.get("name")) or "Industries",
            "keyword": lib.clean(keyword.get("name")) or "",
            "authorName": lib.clean(author.get("name")) or "",
            "authorAvatar": lib.media(author.get("avatar"), lib.clean(author.get("name")) or ""),
            "publishedDate": _date(record.get("createdAt")),
            "content": lib.md(record.get("content")),
            "featured": index == 0,
            **POST_TEMPLATE,
            "subscriptionBackground": lib.media("/backgroud-images/careers.jpg", "Newsletter background"),
            "seo": seo,
        })
    return posts


def _news_articles() -> list[dict]:
    """All Tina press/news records as the news-article collection, in source display order."""
    articles = []
    for order, (_, record) in enumerate(_connection_records("company__news-and-articles", "newsSectionConnection")):
        title = lib.clean(record.get("title")) or ""
        articles.append({
            "title": title,
            "label": lib.clean(record.get("heading")) or "News",
            "image": lib.media(record.get("image"), lib.clean(record.get("heading")) or "News"),
            "url": (record.get("url") or "").strip(),
            "excerpt": lib.clean(record.get("description")) or "",
            "publishedDate": _date(record.get("createdAt")),
            "order": order,
        })
    return articles


def build() -> list[dict]:
    pages = [
        lib.page(
            "company__blog",
            "Blogs",
            [{
                "__component": "content.blog-listing",
                "heading": "Blogs",
                "categoryGroups": _filter_groups(),
                "discoverHeading": "Discover more blogs",
            }],
        ),
        lib.page(
            "company__news-and-articles",
            "News and Articles",
            [{"__component": "content.news-listing", "heading": "News and Articles"}],
        ),
    ]
    for page_key, doc_name in LEGAL_PAGES:
        document = lib.load_docs(page_key).get(doc_name) or {}
        title = lib.clean(document.get("heading")) or ""
        pages.append(lib.page(page_key, title, [{
            "__component": "sections.rich-text",
            "heading": title,
            "body": lib.md(document.get("content")),
            "variant": "legal",
        }]))
    # The original hub URLs intentionally retain a desktop-only blank black body before the footer.
    pages.extend([
        lib.page("industries", "Industries", [{"__component": "content.empty-hub"}]),
        lib.page("services", "Services", [{"__component": "content.empty-hub"}]),
    ])
    return pages


def extra() -> dict[str, list[dict]]:
    """Collection JSON consumed by getBlogPosts() and getNewsArticles() in local-content mode."""
    posts = _blog_posts()
    for index, post in enumerate(posts):
        post.setdefault("order", index)  # original listing order (CMS document order), editable in Strapi
    return {"blog-posts.json": posts, "news-articles.json": _news_articles()}
