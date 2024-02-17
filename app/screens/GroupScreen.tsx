import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ImageStyle, TextStyle, View, ViewStyle, Image } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, ListItem, ListView, Screen, Text, TextField } from "app/components"
import { spacing } from "app/theme"
import { Group, useStores } from "app/models"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface GroupScreenProps extends AppStackScreenProps<"Group"> {}

export const GroupScreen: FC<GroupScreenProps> = observer(function GroupScreen(_props) {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const {
    groupStore,
    authenticationStore: { getAuthToken },
  } = useStores()

  const [groupName, setGroupName] = useState("")

  const [isLoading, setIsLoading] = React.useState(false)

  // Pull in navigation via hook
  // const navigation = useNavigation()
  const mode = _props.route.params.mode

  async function search() {
    setIsLoading(true)
    await groupStore.searchGroupsByName(groupName, getAuthToken())
    setIsLoading(false)
    console.log("Search for group")
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text style={$title} preset="heading" text="Group" />
      <Text
        text="History is written by the ones with clean clothes"
        preset="subheading"
        style={$enterDetails}
      />

      <TextField
        value={groupName}
        onChangeText={setGroupName}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        keyboardType="default"
        label="Group Name"
        placeholder="Super Cleaners"
        onSubmitEditing={search}
      />
      <Button text="Search" style={$button} onPress={search} />

      <ListItem
        text="Super Cleaners"
        leftIcon="slack"
        rightIcon={"caretRight"}
        onPress={() => console.log("Join Group")}
      />
      {/* <ListView<Group>
        contentContainerStyle={$listContentContainer}
        data={episodeStore.episodesForList.slice()}
        extraData={episodeStore.favorites.length + .episodes.length}
        refreshing={refreshing}
        estimatedItemSize={177}
        onRefresh={manualRefresh}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$emptyState}
              headingTx={
                episodeStore.favoritesOnly
                  ? "demoPodcastListScreen.noFavoritesEmptyState.heading"
                  : undefined
              }
              contentTx={
                episodeStore.favoritesOnly
                  ? "demoPodcastListScreen.noFavoritesEmptyState.content"
                  : undefined
              }
              button={episodeStore.favoritesOnly ? "" : undefined}
              buttonOnPress={manualRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={$heading}>
            <Text preset="heading" tx="demoPodcastListScreen.title" />
            {(episodeStore.favoritesOnly || episodeStore.episodesForList.length > 0) && (
              <View style={$toggle}>
                <Toggle
                  value={episodeStore.favoritesOnly}
                  onValueChange={() =>
                    episodeStore.setProp("favoritesOnly", !episodeStore.favoritesOnly)
                  }
                  variant="switch"
                  labelTx="demoPodcastListScreen.onlyFavorites"
                  labelPosition="left"
                  labelStyle={$labelStyle}
                  accessibilityLabel={translate("demoPodcastListScreen.accessibility.switch")}
                />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <EpisodeCard
            episode={item}
            isFavorite={episodeStore.hasFavorite(item)}
            onPressFavorite={() => episodeStore.toggleFavorite(item)}
          />
        )}
      /> */}
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.lg + spacing.xl,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.xxl,
}

const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
}

const $button: ViewStyle = {
  marginBottom: spacing.xs,
}

const $buttonContainer: ViewStyle = {
  marginBottom: spacing.md,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.sm,
}
const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}
