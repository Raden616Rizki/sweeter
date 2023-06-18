function post() {

    let comment = $('#textarea-post').val();
    let today = new Date().toISOString();
    
    $.ajax({
        type: "POST",
        url: '/posting',
        data: {
            comment_give: comment,
            date_give: today,
        },
        success: function(response) {
            $('#modal-post').removeClass('is-active');
            window.location.reload();
        }
    });
}

function time_to_string(date) {
    let today = new Date();
    let time = (today - date) / 1000 / 60;

    if (time < 60) {
        return parseInt(time) + ' minutes ago';
    }

    time = time / 60;

    if (time < 24) {
        return parseInt(time) + ' hours ago';
    }

    time = time / 24;

    if (time < 7) {
        return parseInt(time) + ' days ago';
    }

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    return `${year}/${month}/${day}`
}

function get_posts(username) {
    if (username === undefined) {
        username = '';
    }

    $('#post-box').empty();

    $.ajax({
        type: 'GET',
        url: `/get_posts?username_give=${username}`,
        data: {},
        success: function(response) {

            if (response['result'] === 'success') {

                let posts = response['posts'];

                for (let i = 0; i < posts.length; i++) {

                    let post = posts[i];
                    let time_post = new Date(post['date']);
                    let time_before = time_to_string(time_post);
                    // console.log(post['heart_by_me'], i);
                    let class_heart = post['heart_by_me'] ? 'fa-heart' : 'fa-heart-o';
                    let class_star = post['star_by_me'] ? 'fa-star' : 'fa-star-o';
                    let class_thumbs_up = post['thumbs_up_by_me'] ? 'fa-thumbs-up' : 'fa-thumbs-o-up';
                    // if (post['heart_by_me']) {
                    //     class_heart = 'fa-heart';
                    // } else {
                    //     class_heart = 'fa-heart-o';
                    // }

                    let html_temp = `
                    <div class="box" id="${post['_id']}">
                        <article class="media">
                            <div class="media-left">
                                <a class="image is-64x64" href="/user/${post['username']}">
                                    <img class="is-rounded" src="/static/${post['profile_pic_real']}" alt="Image">
                                </a>
                            </div>
                            <div class="media-content">
                                <div class="content">
                                    <p>
                                        <strong>${post['username']}</strong><small>@${post['profile_name']}</small>
                                        <small>${time_before}</small>
                                        <br>
                                        ${post['comment']}
                                    </p>
                                </div>
                                <nav class="level is-mobile">
                                    <div class="level-left">
                                        <a class="level-item is-sparta" aria-label="heart" onclick="toggle_like('${post["_id"]}', 'heart')">
                                            <span class="icon is-small">
                                                <i class="fa ${class_heart}" area-hidden="true"></i>
                                            </span>&nbsp;<span class="like-num">${num_to_string(post['count_heart'])}</span>
                                        </a>
                                        <a class="level-item is-sparta" aria-label="star" onclick="toggle_like('${post["_id"]}', 'star')">
                                            <span class="icon is-small">
                                                <i class="fa ${class_star}" area-hidden="true"></i>
                                            </span>&nbsp;<span class="like-num">${num_to_string(post['count_star'])}</span>
                                        </a>
                                        <a class="level-item is-sparta" aria-label="thumbs-up" onclick="toggle_like('${post["_id"]}', 'thumbs-up')">
                                            <span class="icon is-small">
                                                <i class="fa ${class_thumbs_up}" area-hidden="true"></i>
                                            </span>&nbsp;<span class="like-num">${num_to_string(post['count_thumbs_up'])}</span>
                                        </a>
                                    </div>
                                </nav>
                            </div>
                        </article>
                    </div>
                    `;

                    $('#post-box').append(html_temp);
                }
            }
        }
    });
}

function toggle_like(post_id, type) {

    let $a_like = $(`#${post_id} a[aria-label="${type}"]`);
    let $i_like = $a_like.find('i');

    if ($i_like.hasClass(`fa-${type}`)) {
        $.ajax({
            type: 'POST',
            url: '/update_like',
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: 'unlike',
            },
            success: function(response) {

                let fa_class = `fa-${type}-o`;

                if (type === 'thumbs-up') {
                    fa_class = 'fa-thumbs-o-up';
                }

                $i_like.addClass(fa_class).removeClass(`fa-${type}`);
                $a_like.find('span.like-num').text(num_to_string(response['count']));
            }
        });
    } else {
        $.ajax({
            type: 'post',
            url: '/update_like',
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: 'like',
            },
            success: function(response) {
                let fa_class = `fa-${type}-o`;

                if (type === 'thumbs-up') {
                    fa_class = 'fa-thumbs-o-up';
                }

                $i_like.addClass(`fa-${type}`).removeClass(fa_class);
                $a_like.find('span.like-num').text(num_to_string(response['count']));
            }
        });
    }
}

function num_to_string(count) {
    if (count > 10000) {
        return parseInt(count / 1000) + 'k';
    }

    if (count > 500) {
        return parseInt(count / 100) / 10 + 'k';
    }

    if (count == 0) {
        return '';
    }

    return count;
}