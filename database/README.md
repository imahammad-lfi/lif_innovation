# Database backup

`linkfields_cms.sql.gz` is a plain-SQL `pg_dump` of the live Strapi database (`linkfields_cms`), taken 2026-11-10 from
PostgreSQL 18.6. It holds all CMS content (pages, global header/footer, events and pop-ups, blog posts, news),
website enquiries (leads), media-library records, admin users and roles, and Strapi settings.

It is **confidential**: it contains visitors' enquiry details and the (hashed) admin passwords. Share it only with
people who host or maintain the site. The website revalidation secret has been removed from the webhook record;
the CMS re-creates the webhook from `WEBSITE_REVALIDATE_URL` and `WEBSITE_REVALIDATE_SECRET` when it starts.

Restore (see ../HANDOVER.md for the full procedure):

    gunzip -c database/linkfields_cms.sql.gz | psql -h <host> -U <user> -d <database>

The media files referenced by these records are in `apps/cms/public/uploads/`.
