import { Variable } from '../../tealiumdeployment/Variable';

export const page_name_var = new Variable(1159, 'page_name', 'udo')
        .setAlias('Page Name')
        .setNotes('Contains a user-friendly name for the page.');

export const dfp_subs_type_var = new Variable(5963, 'dfp_subs_type', 'udo');
export const fb_vc_content_type_var = new Variable(5964, 'fb_vc_content_type', 'udo');
export const user_ssoid_laenge_var = new Variable(7437, 'user_ssoid_laenge', 'udo');
export const appnexus_id_var = new Variable(7438, 'appnexus_id', 'udo');

export const page_sectionpath_6160_var = new Variable(7931, 'page_sectionpath_6160', 'udo')
        .setNotes('AS Attribute 6160')

export const iom_ag_var = new Variable(8427, 'ioam_ag', 'udo');
export const user_segment_var = new Variable(8927, 'user_segment', 'udo');
export const ioam_gen_var = new Variable(8928, 'ioam_gen', 'udo');
export const ad_suite_var = new Variable(8929, 'ad_suite', 'udo');

export const variables = [
    page_name_var,
    dfp_subs_type_var,
    fb_vc_content_type_var,
    user_ssoid_laenge_var,
    appnexus_id_var,
    page_sectionpath_6160_var,
    iom_ag_var,
    user_segment_var,
    ioam_gen_var,
    ad_suite_var
]