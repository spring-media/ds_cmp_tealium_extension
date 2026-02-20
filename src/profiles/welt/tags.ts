import { Tag } from '../../tealiumdeployment/Tag';
import * as vars from './variables';
import { mapVariable } from './helpers';

export const facebook_welt_view_content_tag = new Tag(
    41,
    'Facebook - Welt - View Content'
).setDataMapping([
    mapVariable(vars.fb_vc_content_type_var, ['vc.content_type']),
    mapVariable(vars.page_escenicId_var, ['vc.content_ids']),
    mapVariable(vars.page_sectionPath_var, ['vc.content_category'])
]);

export const tags = [facebook_welt_view_content_tag];
