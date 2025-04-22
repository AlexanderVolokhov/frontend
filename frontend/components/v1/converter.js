function convertLinkFromV2(link) {
    const issues = [].concat(link.from_link.issues, link.status_code.issues, link.title.issues, link.to_link.issues)
    const errors = issues.filter(i => i.type === "error")
    const warnings = issues.filter(i => i.type === "warning")
    return {
        error: errors.length > 0 ? errors : null ,
        from_link: link.from_link.value,
        from_link_encoded: link.from_link.issues.length === 0,
        internal_id: link.internal_id,
        link_id: link.link_id.value ? link.link_id.value : link.link_id,
        status_code: link.status_code.value,
        title: link.title.value,
        title_translation: link.title_translation.value,
        to_link: link.to_link.value,
        to_link_utm: link.to_link.issues.length === 0,
        warning: warnings.length > 0 ? warnings : null
    }
}

function convertCartLinkFromV2(link) {
    return {
        ...convertLinkFromV2(link),
        cart_price_discount: link.cart_price_discount ? link.cart_price_discount.value === undefined ? link.cart_price_discount : link.cart_price_discount.value : null,
        cart_price_old_year: link.cart_price_old_year ? link.cart_price_old_year : link.cart_price_old ? link.cart_price_old : undefined,
        cart_price_new_year: link.cart_price_new_year ? link.cart_price_new_year : link.cart_price_new ? link.cart_price_new : undefined,
        cart_price_old_month: link.cart_price_old_month,
        cart_price_new_month: link.cart_price_new_month,
        cart_price_total: link.cart_price_total,

        source_price_discount: link.source_price_discount ? link.source_price_discount : link.email_price_discount ? link.email_price_discount : undefined,
        source_price_old_year: link.source_price_old_year ? link.source_price_old_year : link.source_price_old ? link.source_price_old : link.email_price_old ? link.email_price_old : undefined,
        source_price_new_year: link.source_price_new_year ? link.source_price_new_year : link.source_price_new ? link.source_price_new : link.email_price_new ? link.email_price_new : undefined,
        source_price_old_month: link.source_price_old_month,
        source_price_new_month: link.source_price_new_month,

        product: link.product.value,
        campaign_marker: link.campaign_marker !== undefined ? link.campaign_marker.value : "N/A",
        coupon: link.coupon !== undefined ? link.coupon.value : "N/A"
    }
}

function convertLPLinkFromV2(link) {
    return {
        ...convertLinkFromV2(link),
        cart_links: link.cart_links.map(l => convertCartLinkFromV2(l))
    }
}

function convertImagesFromV2(image) {
    return {
        alt: image.alt.value,
        alt_en: image.alt_en.value,
        image_id: image.image_id,
        issues: [].concat(image.alt.issues, image.alt_en.issues, image.title.issues, image.title_en.issues, image.url.issues),
        title: image.title.value,
        title_en: image.title_en.value,
        url: image.url.value,
        size: image.size ? Math.round(image.size.value / 1024 * 100) / 100 : undefined // Round up to 2 decimal places and convert to Kb
    }
}

export function convertReportFromV2(emails) {
    const emails_v1 = []
    for (let email of emails) {
        const email_v1 = {
            browser_title: email.browser_title.value,
            cart_links: email.cart_links.map(l => convertCartLinkFromV2(l)),
            email_id: String(email.email_id),
            email_subject: email.email_subject.value,
            images: email.images.map(i => convertImagesFromV2(i)),
            issues: [],
            links: email.links.map(l => convertLinkFromV2(l)),
            locale: email.locale.value,
            orig_subject: email.orig_subject.value,
            pre_header: email.pre_header.value,
            translation: email.translation,
            lp_links: email.lp_links ? email.lp_links.map(l => convertLPLinkFromV2(l)) : []
        }
        emails_v1.push(email_v1)
    }
    return emails_v1
} 
