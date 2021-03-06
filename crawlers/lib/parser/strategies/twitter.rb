module Crawlers::Parser
  class Twitter
    include Common

    def initialize(post)
      @post = post
    end

    def run
      card = Card.new
      card.origin     = 'twitter'
      card.content    = @post.content.text
      card.source_url = "https://twitter.com/" + @post.content.user.fetch('screen_name') +"/status/" + @post.social_uuid if @post.social_uuid && @post.content.user.fetch('screen_name', false)
      card.posted_at  = @post.content.created_at
      card.social_uid = @post.content.user.fetch('id', '')

      card.social_user = {
        id: @post.content.user.fetch('id', ''),
        username: @post.content.user.fetch('screen_name', '')
      }

      begin
        urls = @post.data.fetch('entities', {}).fetch('urls', []).dup
        urls.collect! { |u| self.extract_remix_data_from_url(u['expanded_url']) }.compact!
        unless urls.empty?
          card.remix_image_id = urls.first
        end
      rescue Exception => ex
        puts ex
      end

      if @post.kind == :image
        card.media_type = 'Image'
        card.media_id = self.image(self.image_url)
      elsif @post.kind == 'Video'
        card.media_type = 'Video'
        card.media_id = self.video(self.video_url, @post.social_media, self.image_url)
      end

      unless card.save
        $logger.error('Error saving card: #{card.inspect}')
      end
    end

    def image_url
      if @post.content.entities.fetch('media', {}).first.fetch('type', '') == 'photo'
        @post.content.entities.fetch('media', {}).first.fetch('media_url', nil)
      end
    end

    def video_url
      if @post.content.entities.fetch('media', {}).first.fetch('type', '') == 'video'
        @post.content.entities.fetch('media', {}).first.fetch('media_url', nil)
      end
    end
  end
end
